declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      AUTHORIZATION_TOKEN: string;
      AZURE_STORAGE_ACCOUNT_NAME: string;
      AZURE_STORAGE_ACCOUNT_KEY: string;
      AZURE_STORAGE_CONTAINER_NAME: string;
      AZURE_STORAGE_BLOB_URL: string;
    }
  }
}

export { }