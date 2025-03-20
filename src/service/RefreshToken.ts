import { RefreshTokenData } from '@companieshouse/api-sdk-node/dist/services/refresh-token';
import { createLogger } from '@companieshouse/structured-logging-node';
import { AxiosRequestConfig, AxiosResponse, HttpStatusCode } from 'axios';

import axios from 'axios';
import { APPLICATION_NAME } from 'config/config';


export class RefreshTokenService {
  

  private readonly REFRESH_TOKEN_GRANT_TYPE: string = 'refresh_token';
  

  
  constructor(private readonly uri: string, private readonly clientId: string,
              private readonly clientSecret: string) {
    this.uri = uri;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  
  public async refresh(accessToken: string, refreshToken: string): Promise<string> {
    
    const logger = createLogger(APPLICATION_NAME);
    if (accessToken == null) {
      throw new Error('Access token is missing');
    }

    if (refreshToken == null) {
      throw new Error('Refresh token is missing');
    }

    const requestParams: AxiosRequestConfig = {
      params: {
        'grant_type': this.REFRESH_TOKEN_GRANT_TYPE,
        'refresh_token': refreshToken,
        'client_id': this.clientId,
        'client_secret': this.clientSecret
      }
    };

    logger.debug(`Making a POST request to ${this.uri} for refreshing access token ${accessToken}`);

    return await axios
      .post(this.uri, null, requestParams)
      .then((response: AxiosResponse<RefreshTokenData>) => {
        if (response.status === HttpStatusCode.Ok && response.data) {
            logger.debug(`${RefreshTokenService.name} - refresh: created new access token - ${response.data.access_token}`);
          return response.data.access_token;
        }
        throw new Error('Could not refresh access token');
      });
  }
}