import { CloudAuthIdpType } from 'src/modules/cloud/auth/models';

export interface ICloudApiCredentials {
  accessToken?: string;
  refreshToken?: string;
  idpType?: CloudAuthIdpType;
  apiSessionId?: string;
  csrf?: string;
}
