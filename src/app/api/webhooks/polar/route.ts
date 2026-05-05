import { Webhooks } from "@polar-sh/nextjs";
import {prisma} from "@/lib/db";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",
  onOrderPaid: async (payload) => {
    // Primary: externalCustomerId = our user.id, set during checkout creation
    const externalId = payload.data.customer?.externalId;
    // Fallback: userId stored in order metadata
    const metaUserId = payload.data.metadata?.userId as string | undefined;

    const userId = externalId || metaUserId;
    if (!userId) {
      console.error("Polar webhook: could not identify user for order", payload.data.id);
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isPaid: true },
    });
  },
});
