import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { DrizzleDB } from './drizzle-db';

export const createMockDrizzle = <T>(
  mockedResult: T[],
): DeepMockProxy<DrizzleDB> => {
  const dbService = mockDeep<DrizzleDB>();

  const returningMock = jest.fn().mockResolvedValue(mockedResult);
  const valuesMock = jest.fn().mockReturnValue({ returning: returningMock });
  const whereMock = jest
    .fn()
    .mockReturnValue({ returning: returningMock, execute: returningMock });

  dbService.insert.mockReturnValue({ values: valuesMock } as any);
  dbService.select.mockReturnValue({ where: whereMock } as any);
  dbService.delete.mockReturnValue({ where: whereMock } as any);
  dbService.update.mockReturnValue({
    set: jest.fn().mockReturnValue({ where: whereMock }),
  } as any);

  return dbService;
};
