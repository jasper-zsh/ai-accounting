export class CreateTransactionDTO {
  accountId?: number;
  categoryId?: number;
  type: string;
  amount: number;
  comment?: string;
}
