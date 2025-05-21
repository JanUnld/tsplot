import { InjectionToken, Type } from 'injection-js';
import { ProjectMember } from '../discovery/member';
import { SimpleCache } from './simple-cache';

export type ProjectMemberCache = SimpleCache<ProjectMember['uniqueName'], ProjectMember>;

export const PROJECT_MEMBER_CACHE = new InjectionToken<ProjectMemberCache>(
  'tsp:PROJECT_MEMBER_CACHE'
);

export function provideProjectMemberCache(impl: Type<ProjectMemberCache>) {
  return {
    provide: PROJECT_MEMBER_CACHE,
    useClass: impl,
  };
}
