import { Notifications, NotificationType } from '../models/notifications';

import { v4 as uuidv4 } from 'uuid';

// export const generateAddedInventoryNotification = (
//   userID: string,
//   product_item: ProductItems
// ) => {
//   const notifications: Notifications = {
//     id: uuidv4(),
//     userID: userID,
//     variantID: product_item.id,
//     type: NotificationType.ADDED,
//     message: `new stocks for '${product_item.name}' successfully added! `,
//     createdAt: new Date(),
//   };
//   return notifications;
// };
