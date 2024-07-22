import { ProjectMember } from '../core';
import { Predicate } from './filter-set';

export type MemberFilterFn = Predicate<ProjectMember>;
