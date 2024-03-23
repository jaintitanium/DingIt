export interface Environment {
    production: boolean,
    supabaseUrl: string,
    supabaseKey: string,
    stripeKey?: string,
    appUrl: string,
}