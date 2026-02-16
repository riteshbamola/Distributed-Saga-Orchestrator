import * as sagaService from "./saga";
export const handleMessage = async (topic: string, message: any) => {
  const data = JSON.parse(message.value.toString());

  switch (topic) {
    case "order.created":
      await sagaService.handleOrderCreated(data);
      console.log("Order created");
      break;

    case "inventory.reserved":
      await sagaService.handleInventoryReserved(data);
      console.log("Inventory reserved");
      break;

    case "inventory.failed":
      await sagaService.handleInventoryFailed(data);
      console.log("Inventory failed");
      break;

    case "payment.success":
      await sagaService.handlePaymentSuccess(data);
      console.log("Payment success");
      break;

    case "payment.failed":
      await sagaService.handlePaymentFailed(data);
      console.log("Payment failed");
      break;

    case "inventory.completed":
      await sagaService.handleinventoryCompleted(data);
      console.log("Inventory completed");
      break;

    case "order.confirmed":
      await sagaService.handleOrderConfirmed(data);

      console.log("Order confirmed");

      break;

    default:
      console.log("Unhandled topic:", topic);
  }
};
