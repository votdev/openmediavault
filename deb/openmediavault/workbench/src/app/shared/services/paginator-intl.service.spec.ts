import { PaginatorIntlService } from '~/app/shared/services/paginator-intl.service';

describe('PaginatorIntlService', () => {
  let service: PaginatorIntlService;

  beforeEach(() => {
    service = new PaginatorIntlService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the range of the first page', () => {
    expect(service.getRangeLabel(0, 25, 33)).toBe('1 - 25 of 33');
  });

  it('should return the range of the last page', () => {
    expect(service.getRangeLabel(1, 25, 33)).toBe('26 - 33 of 33');
  });

  it('should return the range of an empty list', () => {
    expect(service.getRangeLabel(0, 25, 0)).toBe('0 - 0 of 0');
  });
});
