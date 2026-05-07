# DingIt Import Data Samples

The local importer is available in the Docker web app at:

```text
http://localhost:8080/import-data
```

Use `imports/samples/sample-cupertino-restaurants-no-images.csv` when you want a quick import test without preparing image files.

Use `imports/samples/sample-cupertino-restaurants-with-images.csv` when you want to test restaurant, promo, and menu item image uploads. Put the matching image files under `imports/images`, then select the CSV and select the whole image folder in the importer.

The local Docker stack includes `dingit-import-log`, a small local-only file writer. Each import creates and updates one JSON file under `docs/import-data/logs`.

Generate a Google Places backed CSV locally:

```powershell
cd Utilities
npm run dingit-importer -- --query "restaurants in Cupertino CA" --limit 10 --out ..\docs\import-data\imports\generated\google-cupertino-restaurants.csv --key-source android
```

Check which committed Maps keys can call Google APIs from this machine:

```powershell
cd Utilities
npm run check-google-maps-keys
```

Run the visible Docker smoke test:

```powershell
cd Utilities
npm run smoke-import-data
```

Generated Google output is written under `docs/import-data/imports/generated/`, which is ignored by Git because customer/import datasets may include licensed data or photos. Import logs are written under `docs/import-data/logs/`, and JSON log files are ignored for the same reason.

Expected image filename examples:

```text
images/koi-palace-contempo-header.jpg
images/koi-palace-contempo-promo.jpg
images/koi-palace-contempo-product-1.jpg
images/koi-palace-contempo-product-2.jpg
```

Image handling:

- Header images are resized by the importer to a max 1600 px full image and a 320 px thumbnail.
- Promo images are resized to a max 1600 px image.
- Product images are resized to a max 1600 px full image and a 320 px thumbnail.
- JPEG, PNG, or WebP source files should work as long as the browser can load them.
- For best app responsiveness, start with landscape restaurant/header photos around 1600 x 900 and square menu photos around 1200 x 1200. The importer will still compress them before upload.

Image sourcing:

- Best source: customer-owned restaurant photos or photos supplied directly by the business.
- Acceptable for local demos: stock or public-domain/Creative Commons images after checking the license for each file.
- Avoid scraping restaurant website, Google Maps, Yelp, DoorDash, Uber Eats, or social media photos unless the customer has explicit rights to reuse those images.
