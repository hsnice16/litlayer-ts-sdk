import {
   CHAINS,
   PLATFORMS,
   GenericObject,
   ENVIRONMENT,
} from "../types"
import { Account as ViemAccount } from "viem";

export interface IHttpClient {
   healthCheck(): Promise<boolean>;

   get<T>(
      path: string,
      queryParams?: Record<string, string | number | boolean | undefined>,
      requestSpecificHeaders?: GenericObject<string>
   ): Promise<T>;
   post<T>(
      path: string,
      body: GenericObject<any>,
      requestSpecificHeaders?: GenericObject<string>
   ): Promise<T>;
   put<T>(
      path: string,
      body: GenericObject<any>,
      requestSpecificHeaders?: GenericObject<string>
   ): Promise<T>;
   delete<T>(
      path: string,
      body: GenericObject<any> | undefined,
      requestSpecificHeaders?: GenericObject<string>
   ): Promise<T>;
   Account: ViemAccount;
   Agent: ViemAccount;
   ChainId: CHAINS;
   Platform: PLATFORMS;
   Environment: ENVIRONMENT;
} 