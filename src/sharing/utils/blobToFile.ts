export const blobToFile = (theBlob: Blob, fileName: string): File => {
  const b: any = theBlob;
  b.lastModifiedDate = new Date();
  b.name = fileName;

  return <File>theBlob;
};
