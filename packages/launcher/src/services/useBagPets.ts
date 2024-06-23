import { DS } from '@/constants';
import type { Pet } from '@sea/core';
import { SEAEventSource, SEAPetStore, Subscription, debounce } from '@sea/core';
import type { SWRSubscriptionOptions } from 'swr/subscription';
import useSWRSubscription from 'swr/subscription';

export function useBagPets() {
    const { data: pets } = useSWRSubscription(
        DS.petBag,
        (_, { next }: SWRSubscriptionOptions<Pet[], Error>) => {
            const bagCache = SEAPetStore.bag;
            const updateBag = bagCache.get.bind(bagCache);
            updateBag().then((pets) => next(null, pets[0]));
            const sub = new Subscription();
            sub.on(SEAEventSource.hook('pet_bag:deactivate'), debounce(updateBag, 500));
            sub.on(SEAEventSource.hook('pet_bag:update'), (pets) => {
                next(null, pets[0]);
            });
            return () => sub.dispose();
        },
        {
            fallbackData: null
        }
    );
    return { pets };
}
