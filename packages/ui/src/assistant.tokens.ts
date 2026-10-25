import { InjectionToken } from '@angular/core';
import { type DraftRepository, type ListingGenerator } from '@finca/application';
export const DRAFT_REPOSITORY = new InjectionToken<DraftRepository>('FINCA draft repository');
export const LISTING_GENERATOR = new InjectionToken<ListingGenerator>('FINCA listing generator');
