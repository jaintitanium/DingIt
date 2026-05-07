import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@app/services/api.service';
import { TitleService } from '@app/services/title.service';
import { UserService } from '@app/services/user.service';
import { environment } from '@app/../environments/environment';
import { Database } from '@custom-types/supabase';

type ImportStatus = 'pending' | 'validating' | 'uploading_images' | 'inserting_data' | 'complete' | 'failed' | 'skipped';
type ImportLogLevel = 'info' | 'warning' | 'error' | 'success';
type ImportRunStatus = 'ready' | 'running' | 'complete' | 'completed_with_errors' | 'stopped' | 'failed';
type ImportTab = 'import' | 'logs';

type CsvRow = Record<string, string>;

interface ProductImport {
  name: string;
  description: string | null;
  priceName: string;
  price: string | null;
  imageName: string | null;
}

interface HoursImport {
  day: number;
  open: string;
  close: string;
}

interface ImportRow {
  index: number;
  input: CsvRow;
  products: ProductImport[];
  hours: HoursImport[];
  errors: string[];
  status: ImportStatus;
  duplicateReason?: string;
  duplicateProviderId?: string;
  providerId?: string;
  message?: string;
}

interface ImportLogEntry {
  at: string;
  level: ImportLogLevel;
  message: string;
  rowIndex?: number;
  restaurant?: string;
  providerId?: string;
}

interface ImportLogSummary {
  totalRows: number;
  validRows: number;
  completeRows: number;
  failedRows: number;
  skippedRows: number;
  imageFiles: number;
}

interface ImportRunLog {
  runId: string;
  fileName: string;
  csvName: string | null;
  startedAt: string;
  finishedAt?: string;
  status: ImportRunStatus;
  savedPath?: string;
  owner?: string;
  summary: ImportLogSummary;
  entries: ImportLogEntry[];
  rows: {
    index: number;
    status: ImportStatus;
    displayName: string;
    city: string;
    state: string;
    providerId?: string;
    message?: string;
    duplicateReason?: string;
    errors: string[];
  }[];
}

interface ImportLogHistoryItem {
  fileName: string;
  path: string;
  bytes: number;
  updatedAt: string;
  runId: string;
  csvName: string;
  startedAt: string;
  finishedAt: string;
  status: ImportRunStatus | 'unknown';
  summary?: Partial<ImportLogSummary>;
  errorCount: number;
}

type ServiceProviderInsert = Database['public']['Tables']['service_provider']['Insert'];
type ServiceProviderUpdate = Database['public']['Tables']['service_provider']['Update'];

@Component({
  selector: 'app-import-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './import-data.page.html',
  styleUrl: './import-data.page.scss'
})
export class ImportDataPage {
  readonly isLocal = !environment.production;
  readonly requiredColumns = ['display_name', 'city', 'state'];
  readonly restaurantColumns = [
    'display_name', 'sub_title', 'address_1', 'address_2', 'city', 'state',
    'postal_code', 'phone_number', 'website', 'timezone', 'lat', 'lng',
  ];
  readonly restaurantImageColumns = ['header_image', 'promo_image'];
  readonly hoursColumns = ['hours_mon', 'hours_tue', 'hours_wed', 'hours_thu', 'hours_fri', 'hours_sat', 'hours_sun'];
  readonly productColumnPattern = 'product_N_name, product_N_description, product_N_price_name, product_N_price, product_N_image';
  readonly productIndexes = Array.from({ length: 20 }, (_, index) => index + 1);
  readonly sampleProductColumns = [
    'product_1_name', 'product_1_description', 'product_1_price_name', 'product_1_price', 'product_1_image',
    'product_2_name', 'product_2_description', 'product_2_price_name', 'product_2_price', 'product_2_image',
  ];
  readonly optionalColumns = [
    'sub_title', 'address_1', 'address_2', 'postal_code', 'phone_number', 'website',
    'timezone', 'lat', 'lng', 'header_image', 'promo_image',
    'hours_mon', 'hours_tue', 'hours_wed', 'hours_thu', 'hours_fri', 'hours_sat', 'hours_sun',
    ...this.productIndexes.flatMap((index) => [
      `product_${index}_name`,
      `product_${index}_description`,
      `product_${index}_price_name`,
      `product_${index}_price`,
      `product_${index}_image`,
    ]),
  ];

  rows: ImportRow[] = [];
  imageFiles = new Map<string, File>();
  selectedCsvName: string | null = null;
  selectedImageCount = 0;
  importing = false;
  stopRequested = false;
  duplicateChecking = false;
  progressMessage = '';
  activeLog: ImportRunLog | null = null;
  logSaveState = '';
  logSaveError = '';
  activeTab: ImportTab = 'import';
  logHistory: ImportLogHistoryItem[] = [];
  selectedHistoryLog: ImportRunLog | null = null;
  historyLoading = false;
  historyError = '';

  constructor(
    private api: ApiService,
    private user: UserService,
    private title: TitleService,
  ) {}

  ngOnInit() {
    this.title.setTitle('Import Data');
    void this.loadImportLogs();
  }

  setTab(tab: ImportTab) {
    this.activeTab = tab;
    if(tab == 'logs') void this.loadImportLogs();
  }

  async loadCsv(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if(!file) return;

    this.selectedCsvName = file.name;
    const text = await file.text();
    const parsed = this.parseCsv(text);
    this.rows = parsed.map((row, index) => this.toImportRow(row, index + 1));
    this.progressMessage = `${this.rows.length} rows loaded from ${file.name}.`;
    this.activeLog = null;
    this.logSaveState = '';
    this.logSaveError = '';
    this.markCsvDuplicates();
    void this.checkExistingDuplicates();
  }

  loadImages(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.imageFiles.clear();
    files.forEach((file) => {
      const path = this.filePath(file);
      this.imageFiles.set(path.toLowerCase(), file);
      this.imageFiles.set(file.name.toLowerCase(), file);
    });
    this.selectedImageCount = files.length;
    if(this.activeLog) {
      this.addLog('info', `${files.length} image files selected.`);
      void this.saveImportLog();
    }
  }

  async startImport() {
    if(this.importDisabled()) return;

    this.importing = true;
    this.stopRequested = false;
    const owner = await this.user.userId();
    if(!owner) {
      this.progressMessage = 'Login required before import can run.';
      this.importing = false;
      return;
    }

    this.activeLog = this.createImportLog(owner);
    this.addLog('info', `Import started for ${this.rows.length} rows from ${this.selectedCsvName ?? 'selected CSV'}.`);
    await this.saveImportLog();

    for(const row of this.rows) {
      if(this.stopRequested) {
        if(row.status == 'pending') {
          row.status = 'skipped';
          row.message = 'Skipped after stop request.';
          this.addLog('warning', 'Row skipped after stop request.', row);
        }
        continue;
      }
      if(row.errors.length > 0) {
        row.status = 'failed';
        row.message = row.errors.join('; ');
        this.addLog('error', row.message, row);
        await this.saveImportLog();
        continue;
      }
      if(row.duplicateReason) {
        row.status = 'skipped';
        row.providerId = row.duplicateProviderId;
        row.message = row.duplicateReason;
        this.addLog('warning', row.duplicateReason, row);
        await this.saveImportLog();
        continue;
      }

      try {
        this.addLog('info', 'Row import started.', row);
        const result = await this.importRow(row, owner);
        if(result == 'skipped') {
          this.addLog('warning', row.message ?? 'Skipped duplicate row.', row);
        } else {
          row.status = 'complete';
          row.message = 'Imported';
          this.addLog('success', `Imported provider ${row.providerId}.`, row);
        }
      } catch(error: any) {
        row.status = 'failed';
        row.message = error?.message ?? JSON.stringify(error);
        this.addLog('error', row.message ?? 'Row import failed.', row);
      }

      await this.saveImportLog();
      await this.delay(25);
    }

    this.importing = false;
    this.progressMessage = this.stopRequested ? 'Import stopped.' : 'Import complete.';
    if(this.activeLog) {
      this.activeLog.finishedAt = new Date().toISOString();
      this.activeLog.status = this.stopRequested
        ? 'stopped'
        : this.failedRows() > 0
          ? 'completed_with_errors'
          : 'complete';
      this.addLog(this.failedRows() > 0 ? 'warning' : 'success', this.progressMessage);
      await this.saveImportLog();
    }
  }

  stopImport() {
    this.stopRequested = true;
    this.progressMessage = 'Stopping after current row...';
    this.addLog('warning', 'Stop requested. Current row will finish before stopping.');
    void this.saveImportLog();
  }

  importDisabled() {
    return !this.isLocal || this.importing || this.rows.length == 0 || this.validRows() == 0;
  }

  validRows() {
    return this.rows.filter((row) => row.errors.length == 0).length;
  }

  completeRows() {
    return this.rows.filter((row) => row.status == 'complete').length;
  }

  failedRows() {
    return this.rows.filter((row) => row.status == 'failed').length;
  }

  skippedRows() {
    return this.rows.filter((row) => row.status == 'skipped').length;
  }

  duplicateRows() {
    return this.rows.filter((row) => !!row.duplicateReason).length;
  }

  productRows() {
    return this.rows.reduce((total, row) => total + row.products.length, 0);
  }

  productImageRows() {
    return this.rows.reduce((total, row) => total + row.products.filter((product) => !!product.imageName).length, 0);
  }

  rowImageCount(row: ImportRow) {
    return (row.input['header_image'] ? 1 : 0)
      + (row.input['promo_image'] ? 1 : 0)
      + row.products.filter((product) => !!product.imageName).length;
  }

  logErrors() {
    return this.activeLog?.entries.filter((entry) => entry.level == 'error') ?? [];
  }

  recentLogEntries() {
    return this.activeLog?.entries.slice(-100).reverse() ?? [];
  }

  historyImportedTotal() {
    return this.logHistory.reduce((total, log) => total + (log.summary?.completeRows ?? 0), 0);
  }

  historyFailedTotal() {
    return this.logHistory.reduce((total, log) => total + (log.summary?.failedRows ?? 0), 0);
  }

  selectedHistoryErrors() {
    return this.selectedHistoryLog?.entries.filter((entry) => entry.level == 'error') ?? [];
  }

  selectedHistoryEntries() {
    return this.selectedHistoryLog?.entries.slice(-100).reverse() ?? [];
  }

  async loadImportLogs() {
    if(!environment.importLogUrl) return;

    this.historyLoading = true;
    this.historyError = '';
    try {
      const response = await fetch(environment.importLogUrl);
      const result = await response.json();
      if(!response.ok) throw new Error(result.error ?? `Log history failed with HTTP ${response.status}`);
      this.logHistory = (result.logs ?? []).map((log: Partial<ImportLogHistoryItem>) => ({
        ...log,
        fileName: log.fileName ?? '',
        path: log.path ?? '',
        bytes: log.bytes ?? 0,
        updatedAt: log.updatedAt ?? '',
        runId: log.runId ?? '',
        csvName: log.csvName ?? '',
        startedAt: log.startedAt ?? log.updatedAt ?? '',
        finishedAt: log.finishedAt ?? '',
        status: log.status ?? 'unknown',
        summary: log.summary ?? {},
        errorCount: log.errorCount ?? 0,
      }));
      if(!this.selectedHistoryLog && this.logHistory.length > 0) {
        await this.selectImportLog(this.logHistory[0]);
      }
    } catch(error: any) {
      this.historyError = error?.message ?? JSON.stringify(error);
    } finally {
      this.historyLoading = false;
    }
  }

  async selectImportLog(item: ImportLogHistoryItem) {
    if(!environment.importLogUrl) return;

    this.historyError = '';
    try {
      const response = await fetch(`${environment.importLogUrl}/${encodeURIComponent(item.fileName)}`);
      const result = await response.json();
      if(!response.ok || !result.ok) throw new Error(result.error ?? `Log load failed with HTTP ${response.status}`);
      this.selectedHistoryLog = {
        ...result.log,
        summary: result.log?.summary ?? this.emptyLogSummary(),
        entries: result.log?.entries ?? [],
        rows: result.log?.rows ?? [],
      };
    } catch(error: any) {
      this.historyError = error?.message ?? JSON.stringify(error);
    }
  }

  private async importRow(row: ImportRow, owner: string): Promise<'imported' | 'skipped'> {
    row.status = 'validating';
    const existingProvider = await this.findExistingProvider(row, owner);
    if(existingProvider) {
      row.providerId = existingProvider;
      row.status = 'skipped';
      row.message = `Skipped duplicate. Existing provider: ${existingProvider}`;
      return 'skipped';
    }

    const providerPayload: ServiceProviderInsert = {
      display_name: row.input['display_name'],
      sub_title: row.input['sub_title'] || null,
      address_1: row.input['address_1'] || null,
      address_2: row.input['address_2'] || null,
      city: row.input['city'] || null,
      state: row.input['state'] || null,
      postal_code: row.input['postal_code'] || null,
      phone_number: row.input['phone_number'] || null,
      website: row.input['website'] || null,
      timezone: row.input['timezone'] || null,
      owner,
    };

    const lat = this.toNumber(row.input['lat']);
    const lng = this.toNumber(row.input['lng']);
    if(lat != null && lng != null) {
      providerPayload.location = `POINT(${lng} ${lat})`;
    }

    row.status = 'inserting_data';
    const provider = await this.api.client()
      .from('service_provider')
      .insert(providerPayload)
      .select('id')
      .single();

    if(provider.error) throw provider.error;
    if(!provider.data?.id) throw new Error('Provider insert returned no id.');

    const providerId = provider.data.id;
    row.providerId = providerId;

    row.status = 'uploading_images';
    const providerImages: ServiceProviderUpdate = {};
    const header = await this.uploadImagePair(row.input['header_image'], `${providerId}/header`);
    if(header.fullPath) providerImages['header_image_path'] = header.fullPath;
    if(header.thumbnailPath) providerImages['header_thumbnail_path'] = header.thumbnailPath;

    const promo = await this.uploadSingleImage(row.input['promo_image'], `${providerId}/promo`);
    if(promo) providerImages['promo_image_path'] = promo;

    if(Object.keys(providerImages).length > 0) {
      const imageUpdate = await this.api.client()
        .from('service_provider')
        .update(providerImages)
        .eq('id', providerId);
      if(imageUpdate.error) throw imageUpdate.error;
    }

    row.status = 'inserting_data';
    for(let index = 0; index < row.products.length; index++) {
      await this.importProduct(providerId, row.products[index], index);
    }

    if(row.hours.length > 0) {
      const hoursPayload = row.hours.map((hour) => ({
        service_provider: providerId,
        day_of_week: hour.day,
        open_time: hour.open,
        close_time: hour.close,
      }));
      const hoursResult = await this.api.client().from('service_provider_hours').insert(hoursPayload);
      if(hoursResult.error) throw hoursResult.error;
    }

    return 'imported';
  }

  private async findExistingProvider(row: ImportRow, owner: string) {
    let query = this.api.client()
      .from('service_provider')
      .select('id')
      .eq('owner', owner)
      .eq('display_name', row.input['display_name'])
      .eq('city', row.input['city'])
      .eq('state', row.input['state'])
      .limit(1);

    if(row.input['address_1']) {
      query = query.eq('address_1', row.input['address_1']);
    } else {
      query = query.is('address_1', null);
    }

    const result = await query.maybeSingle();
    if(result.error) throw result.error;
    return result.data?.id ?? null;
  }

  private markCsvDuplicates() {
    const seen = new Map<string, number>();
    this.rows.forEach((row) => {
      row.duplicateReason = undefined;
      row.duplicateProviderId = undefined;
      const key = this.duplicateKey(row);
      if(!key) return;
      const firstRow = seen.get(key);
      if(firstRow) {
        row.duplicateReason = `Duplicate in CSV. First matching row: ${firstRow}.`;
      } else {
        seen.set(key, row.index);
      }
    });
  }

  private async checkExistingDuplicates() {
    const owner = await this.user.userId();
    if(!owner || this.rows.length == 0) return;

    this.duplicateChecking = true;
    this.progressMessage = `Checking ${this.rows.length} rows for duplicates...`;

    for(const row of this.rows) {
      if(row.errors.length > 0 || row.duplicateReason?.startsWith('Duplicate in CSV')) continue;
      try {
        const existingProvider = await this.findExistingProvider(row, owner);
        if(existingProvider) {
          row.duplicateProviderId = existingProvider;
          row.duplicateReason = `Already exists. Existing provider: ${existingProvider}.`;
        }
      } catch(error: any) {
        row.errors.push(error?.message ?? JSON.stringify(error));
      }
    }

    this.duplicateChecking = false;
    this.progressMessage = `${this.rows.length} rows loaded. ${this.duplicateRows()} duplicates found.`;
  }

  private duplicateKey(row: ImportRow) {
    const parts = [
      row.input['display_name'],
      row.input['address_1'],
      row.input['city'],
      row.input['state'],
    ].map((part) => (part ?? '').trim().toLowerCase());
    if(!parts[0] || !parts[2] || !parts[3]) return '';
    return parts.join('|');
  }

  private async importProduct(providerId: string, product: ProductImport, order: number) {
    const productId = self.crypto.randomUUID();
    const image = await this.uploadImagePair(product.imageName, `${providerId}/menu/${productId}`);

    const result = await this.api.client().from('product').insert({
      id: productId,
      service_provider: providerId,
      display_name: product.name,
      description: product.description,
      order,
      image_path: image.fullPath,
      thumbnail_path: image.thumbnailPath,
    });
    if(result.error) throw result.error;

    if(product.price) {
      const price = await this.api.client().from('product_price').insert({
        product: productId,
        name: product.priceName || 'Regular',
        price: product.price,
      });
      if(price.error) throw price.error;
    }
  }

  private async uploadImagePair(imageName: string | null | undefined, pathBase: string) {
    if(!imageName) return { fullPath: null, thumbnailPath: null };
    const file = this.lookupImage(imageName);
    if(!file) throw new Error(`Image not found: ${imageName}`);

    const fullBlob = await this.resizeImage(file, 1600, 0.82);
    const fullPath = `${pathBase}.jpg`;
    const fullUpload = await this.api.client().storage.from('service_providers').upload(fullPath, fullBlob, {
      upsert: true,
      contentType: 'image/jpeg',
    });
    if(fullUpload.error) throw fullUpload.error;

    const thumbBlob = await this.resizeImage(file, 320, 0.72);
    const thumbnailPath = `${pathBase}_thumb.jpg`;
    const thumbUpload = await this.api.client().storage.from('service_providers').upload(thumbnailPath, thumbBlob, {
      upsert: true,
      contentType: 'image/jpeg',
    });
    if(thumbUpload.error) throw thumbUpload.error;

    return { fullPath: fullUpload.data.path, thumbnailPath: thumbUpload.data.path };
  }

  private async uploadSingleImage(imageName: string | null | undefined, pathBase: string) {
    if(!imageName) return null;
    const file = this.lookupImage(imageName);
    if(!file) throw new Error(`Image not found: ${imageName}`);

    const blob = await this.resizeImage(file, 1600, 0.82);
    const path = `${pathBase}.jpg`;
    const result = await this.api.client().storage.from('service_providers').upload(path, blob, {
      upsert: true,
      contentType: 'image/jpeg',
    });
    if(result.error) throw result.error;
    return result.data.path;
  }

  private resizeImage(file: File, maxSize: number, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if(!context) {
          reject(new Error('Could not create image canvas.'));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if(blob) resolve(blob);
          else reject(new Error('Could not compress image.'));
        }, 'image/jpeg', quality);
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Could not read image: ${file.name}`));
      };

      image.src = url;
    });
  }

  private lookupImage(name: string) {
    const normalized = name.trim().replaceAll('\\', '/').toLowerCase();
    return this.imageFiles.get(normalized) ?? this.imageFiles.get(normalized.split('/').pop() ?? '');
  }

  private filePath(file: File) {
    const withPath = file as File & { webkitRelativePath?: string };
    return withPath.webkitRelativePath || file.name;
  }

  private toImportRow(input: CsvRow, index: number): ImportRow {
    const errors: string[] = [];
    this.requiredColumns.forEach((column) => {
      if(!input[column]) errors.push(`Missing ${column}`);
    });

    const lat = this.toNumber(input['lat']);
    const lng = this.toNumber(input['lng']);
    if((input['lat'] || input['lng']) && (lat == null || lng == null)) {
      errors.push('lat and lng must both be valid numbers when provided');
    }

    this.validateProductColumns(input, errors);

    return {
      index,
      input,
      products: this.extractProducts(input),
      hours: this.extractHours(input),
      errors,
      status: 'pending',
    };
  }

  private extractProducts(input: CsvRow) {
    const products: ProductImport[] = [];
    for(let i = 1; i <= 20; i++) {
      const name = input[`product_${i}_name`];
      if(!name) continue;
      products.push({
        name,
        description: input[`product_${i}_description`] || null,
        priceName: input[`product_${i}_price_name`] || 'Regular',
        price: input[`product_${i}_price`] || null,
        imageName: input[`product_${i}_image`] || null,
      });
    }
    return products;
  }

  private validateProductColumns(input: CsvRow, errors: string[]) {
    let productCount = 0;
    for(let i = 1; i <= 20; i++) {
      const name = input[`product_${i}_name`];
      const description = input[`product_${i}_description`];
      const priceName = input[`product_${i}_price_name`];
      const price = input[`product_${i}_price`];
      const image = input[`product_${i}_image`];
      const hasAnyProductField = !!(name || description || priceName || price || image);
      if(!hasAnyProductField) continue;

      productCount++;
      if(!name) errors.push(`product_${i}_name is required when product_${i} fields are provided`);
      if(!image) errors.push(`product_${i}_image is required so menu/product cards do not import without images`);
    }

    if(productCount == 0) {
      errors.push('At least one product is required. Add product_1_name and product_1_image columns for the first menu item.');
    }
  }

  private extractHours(input: CsvRow) {
    const columns = [
      ['hours_sun', 0],
      ['hours_mon', 1],
      ['hours_tue', 2],
      ['hours_wed', 3],
      ['hours_thu', 4],
      ['hours_fri', 5],
      ['hours_sat', 6],
    ] as const;

    return columns.flatMap(([column, day]) => {
      const value = input[column];
      if(!value) return [];
      const match = value.match(/^\s*([0-2]?\d:[0-5]\d)\s*-\s*([0-2]?\d:[0-5]\d)\s*$/);
      if(!match) return [];
      return [{ day, open: match[1], close: match[2] }];
    });
  }

  private parseCsv(text: string) {
    const records: string[][] = [];
    let field = '';
    let row: string[] = [];
    let inQuotes = false;

    for(let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if(char == '"' && inQuotes && next == '"') {
        field += '"';
        i++;
      } else if(char == '"') {
        inQuotes = !inQuotes;
      } else if(char == ',' && !inQuotes) {
        row.push(field);
        field = '';
      } else if((char == '\n' || char == '\r') && !inQuotes) {
        if(char == '\r' && next == '\n') i++;
        row.push(field);
        if(row.some((value) => value.trim() != '')) records.push(row);
        field = '';
        row = [];
      } else {
        field += char;
      }
    }

    row.push(field);
    if(row.some((value) => value.trim() != '')) records.push(row);

    if(records.length < 2) return [];

    const headers = records[0].map((header) => this.normalizeHeader(header));
    return records.slice(1).map((values) => {
      const output: CsvRow = {};
      headers.forEach((header, index) => {
        output[header] = (values[index] ?? '').trim();
      });
      return output;
    });
  }

  private normalizeHeader(header: string) {
    return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  private toNumber(value: string | undefined) {
    if(!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private createImportLog(owner: string): ImportRunLog {
    const startedAt = new Date().toISOString();
    const runId = self.crypto.randomUUID();
    const csvSlug = this.slugify(this.selectedCsvName ?? 'import');
    const timestamp = startedAt.replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z');
    return {
      runId,
      fileName: `${timestamp}-${csvSlug}-${runId.slice(0, 8)}.json`,
      csvName: this.selectedCsvName,
      startedAt,
      status: 'running',
      owner,
      summary: this.currentSummary(),
      entries: [],
      rows: this.serializeRows(),
    };
  }

  private addLog(level: ImportLogLevel, message: string, row?: ImportRow) {
    if(!this.activeLog) return;
    this.activeLog.entries.push({
      at: new Date().toISOString(),
      level,
      message,
      rowIndex: row?.index,
      restaurant: row?.input['display_name'],
      providerId: row?.providerId,
    });
  }

  private async saveImportLog() {
    if(!this.activeLog || !environment.importLogUrl) return;

    this.activeLog.summary = this.currentSummary();
    this.activeLog.rows = this.serializeRows();

    try {
      const response = await fetch(environment.importLogUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(this.activeLog),
      });
      const result = await response.json();
      if(!response.ok || !result.ok) {
        throw new Error(result.error ?? `Log save failed with HTTP ${response.status}`);
      }
      this.activeLog.savedPath = result.path;
      this.logSaveState = `Log file: ${result.path}`;
      this.logSaveError = '';
      void this.loadImportLogs();
    } catch(error: any) {
      this.logSaveState = '';
      this.logSaveError = error?.message ?? JSON.stringify(error);
    }
  }

  private currentSummary(): ImportLogSummary {
    return {
      totalRows: this.rows.length,
      validRows: this.validRows(),
      completeRows: this.completeRows(),
      failedRows: this.failedRows(),
      skippedRows: this.skippedRows(),
      imageFiles: this.selectedImageCount,
    };
  }

  private emptyLogSummary(): ImportLogSummary {
    return {
      totalRows: 0,
      validRows: 0,
      completeRows: 0,
      failedRows: 0,
      skippedRows: 0,
      imageFiles: 0,
    };
  }

  private serializeRows() {
    return this.rows.map((row) => ({
      index: row.index,
      status: row.status,
      displayName: row.input['display_name'],
      city: row.input['city'],
      state: row.input['state'],
      providerId: row.providerId,
      message: row.message,
      duplicateReason: row.duplicateReason,
      errors: row.errors,
    }));
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || 'import';
  }
}
