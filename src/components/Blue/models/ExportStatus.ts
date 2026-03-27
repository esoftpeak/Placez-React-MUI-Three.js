export enum ExportStatus {
  ExportRequired = 'export-required',
  Exporting = 'exporting',
  Exported = 'exported',
  Uploading = 'uploading',
  Uploaded = 'uploaded',
}

export const exportInProgress = (status: ExportStatus): boolean =>
  status === ExportStatus.Exporting || status === ExportStatus.Uploading;
