export const QueueNames = {
  FullShortCodePool: 'fullShortCodePoolQueue',
  ProcessClick: 'processClickQueue',
  ProcessLoginUpdate: 'processLoginUpdateQueue',
};
export type QueueName = keyof typeof QueueNames;