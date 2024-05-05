export class FilterDocumentDto {
    startDate: string; // Use string type for dates to accommodate different date formats and then convert to Date in the service
    endDate: string;
  }
  