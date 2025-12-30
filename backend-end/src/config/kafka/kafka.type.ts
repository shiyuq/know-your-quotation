export type KafkaConfig = {
  topic?: string;
  clientId?: string;
  groupId?: string;
  brokers: string;
};
