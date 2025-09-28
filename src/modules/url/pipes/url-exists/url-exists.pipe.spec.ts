import { UrlService } from '@modules/url/url.service';
import { UrlExistsPipe } from './url-exists.pipe';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UrlType } from '@modules/url/schema';
import { NotFoundException } from '@nestjs/common';

describe('UrlExistsPipe', () => {
  let urlExistsPipe: UrlExistsPipe;
  let urlService: DeepMocked<UrlService>;

  beforeEach(() => {
    urlService = createMock<UrlService>();
    urlExistsPipe = new UrlExistsPipe(urlService);
  });

  it('should be defined', () => {
    expect(urlExistsPipe).toBeDefined();
  });

  // Happy path: redirect to the redirectUrl
  it("Should return the url object if it's found", async () => {
    const url: UrlType = {
      id: 1,
      redirect: 'https://airbnb.com',
      url: 'localhost:3000/random-uid',
      title: 'Airbnb',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    urlService.findOne.mockResolvedValueOnce(url);
    const result = await urlExistsPipe.transform('random-uid');
    expect(result).toEqual(url);
  });

  // Unhappy path: throw an exception
  it('Should return exeception when no url is found', async () => {
    urlService.findOne.mockResolvedValueOnce(null!);
    const result = () => urlExistsPipe.transform('random-uid');
    await expect(result).rejects.toThrow(NotFoundException);
  });
});
