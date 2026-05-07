import { Environment } from "@app/../../interfaces/environment";

// Physical Android device using adb reverse: localhost on the device is forwarded to the host machine.
export const environment:Environment = {
    production: false,
    appUrl: "http://localhost:8080/",
    supabaseUrl: "http://localhost:54321",
    supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
    stripeKey: "pk_test_51PoWC1J2uBT3FJoZ9e5L3OlYzJyhlqMrtv4m3eMJwUqSjO5x3dSz7qIcc63b7tPMbI8kJzRvIukSchdM5SKz6KIh00vKKKJ5y2",
    importLogUrl: "http://localhost:8091/import-logs"
};
