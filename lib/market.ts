import { OrderStatus } from '@prisma/client';

export const orderStatusMap: Record<OrderStatus, string> = {
  ALINDI: 'Alındı',
  HAZIRLANIYOR: 'Hazırlanıyor',
  KARGODA: 'Kargoda',
  TESLIM_EDILDI: 'Teslim Edildi',
  IPTAL_EDILDI: 'İptal Edildi'
};
