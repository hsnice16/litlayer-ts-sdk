import {
   validateStringRequiredParameter,
} from "../utils"
import {
   CreateAccountSchema,
   DeleteAccountSchema,
   SwitchAccountSchema,
   TransferFundSchema,
   UpdateAccountSchema,
   UpdateProfileSchema,
   SubmitWithdrawSchema,
} from "./schemas/user"
import {
   UserCreateAccount,
   UserQueryBalancesResponse,
   UserQueryPerformancesResponse,
   UserQueryProfile,
   UserQuerySubAccountsResponse,
   GenericObject,
} from "../types"
import { IHttpClient } from "../clients/IHttpClient";

export class User {
   private client: IHttpClient;
   private mainAccountAddress: string;

   constructor(
      internalHttpClient: IHttpClient
   ) {
      this.client = internalHttpClient;
      this.mainAccountAddress = internalHttpClient.Account.address!;
   }

   /**
    *
    * @summary Query User Sub-Account
    * @param {string} [address] User Address, Optional
    * @throws {RequiredError} RequiredError
    * @returns {UserQuerySubAccountsResponse[]} Promise
    */
   async querySubAccounts(
      address?: string
   ): Promise<UserQuerySubAccountsResponse[]> {
      const userAddress = address ? address : this.mainAccountAddress;
      validateStringRequiredParameter(userAddress, "userAddress");
      const urlPath = `v1/user/${userAddress}/account`;
      return this.client.get<UserQuerySubAccountsResponse[]>(urlPath);
   }

   /**
    *
    * @summary Query User Balance
    * @param {string} [address] User Address, Optional
    * @throws {RequiredError} RequiredError
    * @returns {UserQueryBalancesResponse[]} Promise
    */
   async queryBalances(address?: string): Promise<UserQueryBalancesResponse[]> {
      const userAddress = address ? address : this.mainAccountAddress;
      validateStringRequiredParameter(userAddress, "userAddress");
      const urlPath = `v1/user/${userAddress}/balance`;
      return this.client.get<UserQueryBalancesResponse[]>(urlPath);
   }

   /**
    *
    * @summary Query User Performance
    * @param {string} [address] User Address, Optional
    * @throws {RequiredError} RequiredError
    * @returns {UserQueryPerformancesResponse[]} Promise
    */
   async queryPerformances(
      address?: string
   ): Promise<UserQueryPerformancesResponse[]> {
      const userAddress = address ? address : this.mainAccountAddress;
      validateStringRequiredParameter(userAddress, "userAddress");
      const urlPath = `v1/user/${userAddress}/performance`;
      return this.client.get<UserQueryPerformancesResponse[]>(urlPath);
   }

   /**
    *
    * @summary Query User Profile
    * @param {string} [address] User Address, Optional
    * @throws {RequiredError} RequiredError
    * @returns {UserQueryProfile} Promise
    */
   async queryProfile(address?: string): Promise<UserQueryProfile> {
      const userAddress = address ? address : this.mainAccountAddress;
      validateStringRequiredParameter(userAddress, "userAddress");
      const urlPath = `v1/user/${userAddress}/profile`;
      return this.client.get<UserQueryProfile>(urlPath);
   }

   /**
    *
    * @summary Create User Sub-Account
    * @param {string} name Account Name
    * @throws {RequiredError} RequiredError
    * @returns {UserCreateAccount} Promise
    */
   async createAccount(
      name: string,
   ): Promise<UserCreateAccount> {
      const validatedPayload = CreateAccountSchema.parse({ name });
      const urlPath = "v1/user/account/create";
      let extraHeaders: GenericObject<string> = {};
      return this.client.post<UserCreateAccount>(
         urlPath,
         validatedPayload,
         extraHeaders,
      );
   }

   /**
    *
    * @summary Delete User Sub-Account
    * @param {number} subAccountId Sub Account ID
    * @throws {RequiredError} RequiredError
    * @returns {string} Promise
    */
   async deleteAccount(
      subAccountId: number,
   ): Promise<string> {
      const validatedPayload = DeleteAccountSchema.parse({ sub_account_id: subAccountId });
      const urlPath = "v1/user/account/delete";
      let extraHeaders: GenericObject<string> = {};
      return this.client.delete<string>(
         urlPath,
         validatedPayload,
         extraHeaders,
      );
   }

   /**
    *
    * @summary Switch Current User Sub-Account
    * @param {number} subAccountId Sub Account ID
    * @throws {RequiredError} RequiredError
    * @returns {string} Promise
    */
   async switchAccount(
      subAccountId: number,
   ): Promise<string> {
      const validatedPayload = SwitchAccountSchema.parse({ sub_account_id: subAccountId });
      const urlPath = "v1/user/account/switch";
      return this.client.post<string>(
         urlPath,
         validatedPayload,
      );
   }

   /**
    *
    * @summary Transfer User Fund to Sub-Account
    * @param {string} amount Fund Amount
    * @param {number} subAccountId Sub Account ID
    * @param {number} subAccountIdFrom Sub Account ID From
    * @throws {RequiredError} RequiredError
    * @returns {string} Promise
    */
   async transferFund(
      amount: string,
      subAccountId: number,
      subAccountIdFrom: number
   ): Promise<string> {
      const validatedPayload = TransferFundSchema.parse({
         amount: amount,
         sub_account_id: subAccountId,
         sub_account_id_from: subAccountIdFrom,
      });
      const urlPath = "v1/user/account/transfer-fund";
      return this.client.post<string>(
         urlPath,
         validatedPayload,
      );
   }

   /**
    *
    * @summary Update User Account
    * @param {string} avatar Account New Avatar
    * @param {string} name Account New Name
    * @param {number} subAccountId Sub Account ID
    * @throws {RequiredError} RequiredError
    * @returns {string} Promise
    */
   async updateAccount(
      avatar: string,
      name: string,
      subAccountId: number
   ): Promise<string> {
      const validatedPayload = UpdateAccountSchema.parse({
         acc_avatar: avatar,
         acc_name: name,
         sub_account_id: subAccountId,
      });
      const urlPath = "v1/user/account/update";
      return this.client.post<string>(
         urlPath,
         validatedPayload,
      );
   }

   /**
    *
    * @summary Update User Profile
    * @param {string} nickname User New Nickname
    * @throws {RequiredError} RequiredError
    * @returns {string} Promise
    */
   async updateProfile(
      nickname: string,
   ): Promise<string> {
      const validatedPayload = UpdateProfileSchema.parse({ nickname });
      const urlPath = "v1/user/profile/update";
      return this.client.post<string>(
         urlPath,
         validatedPayload,
      );
   }

   /**
    *
    * @summary Submit a withdrawal request
    * @param {number} withdrawAmount Amount to withdraw
    * @throws {RequiredError} RequiredError
    * @returns {string} Promise
    */
   async submitWithdraw(
      withdrawAmount: number,
   ): Promise<string> {
      const validatedPayload = SubmitWithdrawSchema.parse({ withdraw_amount: withdrawAmount });
      const urlPath = "v1/withdraw/submit";
      return this.client.post<string>(
         urlPath,
         validatedPayload,
      );
   }
}
