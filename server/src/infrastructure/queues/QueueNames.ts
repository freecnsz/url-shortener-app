export const QueueNames = {
  FullShortCodePool: 'fullShortCodePoolQueue',
  ProcessClick: 'processClickQueue'
};
export type QueueName = keyof typeof QueueNames;