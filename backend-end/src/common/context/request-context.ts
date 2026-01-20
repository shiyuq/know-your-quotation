import { GlobalRole, UserStatus } from '@/constants';

import { AsyncLocalStorage } from 'async_hooks';
import { UnauthorizedException } from '@nestjs/common';

export interface RequestContext {
  user?: {
    userId: string;
    username?: string;
    role: GlobalRole;
    status: UserStatus;
    tenantId: string | null;
    tenantName: string | null;
    [key: string]: any;
  };

  tenant: {
    tenantId?: string;
    isActive: boolean;
  };

  traceId: string;
  requestId: string;
  ip?: string;
}

export const requestContextALS = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext {
  const store = requestContextALS.getStore();
  if (!store) {
    throw new Error('Request context not available');
  }
  return store;
}

export function getCurrentUserOrThrow(): RequestContext['user'] {
  const user = getRequestContext().user;
  if (!user) throw new UnauthorizedException('User context missing');
  return user;
}

export function getCurrentTenantOrThrow(): RequestContext['tenant'] {
  const tenant = getRequestContext().tenant;
  if (!tenant?.tenantId) {
    throw new Error('Tenant context missing - critical in SaaS');
  }
  return tenant;
}

export function getCurrentCtx(): RequestContext {
  return getRequestContext();
}
