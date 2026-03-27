export default interface MediaEntityBase {
  id?: string;
  name?: string;
  sortOrder?: number;
  deleted?: boolean;
  version?: string;
  createdUtcDateTime?: Date;
  modifiedUtcDateTime?: Date;
  createdBy?: string;
  modifiedBy?: string;
  organizationId?: number;
}
