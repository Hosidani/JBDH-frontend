// TypeScript interfaces for your data models
export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface DataFlow {
  id: number;
  content: string;
  contentType: 'text' | 'image' | 'video' | 'link';
  createdAt: string;
  userId: number;
  user?: User;
  parentDataFlowId?: number;
  relatedDataFlows?: DataFlow[];
}

export interface ListDataFlowViewModel {
  dataFlows: DataFlow[];
}

export interface ReportRequest {
  reportedUserId: number;
  dataFlowId: number;
  dataFlowText: string;
  reason: string;
}

export interface CommentRequest {
  dataFlowId: number;
  comment: string;
}

export interface CreateFlowRequest {
  content: string;
  contentType: 'text' | 'image' | 'video' | 'link';
}