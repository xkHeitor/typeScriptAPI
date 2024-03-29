import { StormGlass } from '@src/clients/stormGlass/stormGlass';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalizedWeather3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import * as HTTPUtil from '@src/util/request'

const lat = 33.792726;
const lng = 151.289824;

jest.mock('@src/util/request');

describe('StormGlass client', () => {

    const MockedRequestClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>;
    const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;

    it('should return the normalized forecast from the StormGlass service', async () => {

        mockedRequest.get.mockResolvedValue({ 
            data: stormGlassWeather3HoursFixture 
        } as HTTPUtil.Response );

        const stormGlass    = new StormGlass(mockedRequest);
        const response      = await stormGlass.fetchPoints(lat, lng);
        expect(response).toEqual(stormGlassNormalizedWeather3HoursFixture);
    });

    it ('should exclude incumokete data points', async () => {
 
        const incompleteResponse = {
            hours: [
                {
                    windDirection: {
                        noaa: 300,
                    },
                    time: '202004-24T00:00:00+00:00'
                }
            ]
        };
        mockedRequest.get.mockResolvedValue({ 
            data: incompleteResponse 
        } as HTTPUtil.Response);

        const stormGlass    = new StormGlass(mockedRequest);
        const response      = await stormGlass.fetchPoints(lat, lng);

        expect(response).toEqual([]);
    });

    it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
        mockedRequest.get.mockRejectedValue({ message: 'Network Error' });

        const stormGlass = new StormGlass(mockedRequest);
        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            'Unexpected error when trying to communicate to StormGlass: Network Error'
        );
    });

    it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
        MockedRequestClass.isRequestError.mockReturnValue(true);
        mockedRequest.get.mockRejectedValue({
            response: {
                status: 429,
                data: {
                    errors: ['Rate Limit reached']
                }
            }
        });

        const stormGlass = new StormGlass(mockedRequest);
        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            `Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429`
        );
    });

});