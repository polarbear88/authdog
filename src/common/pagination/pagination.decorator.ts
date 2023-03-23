export const PAGINATION_WHERE = '_pagination_where';
export const PAGINATION_PAGE = '_pagination_page';
export const PAGINATION_PAGE_SIZE = '_pagination_page_size';

export function PaginationWhere(where?: string) {
    return (target: any, propertyKey: string | symbol) => {
        const privateProp = `_${String(propertyKey)}`;
        target[privateProp] = target[propertyKey];

        Object.defineProperty(target, propertyKey, {
            get() {
                return this[privateProp];
            },
            set(newValue: any) {
                const data = this[PAGINATION_WHERE] || {};
                const query = [where, newValue];
                data[propertyKey] = query;
                if (newValue === undefined || newValue === '') {
                    delete data[propertyKey];
                }
                this[PAGINATION_WHERE] = data;
                this[privateProp] = newValue;
            },
            enumerable: true,
            configurable: true,
        });
    };
}

export function PaginationPage() {
    return (target: any, propertyKey: string | symbol) => {
        const privateProp = `_${String(propertyKey)}`;
        target[privateProp] = target[propertyKey];
        Object.defineProperty(target, propertyKey, {
            get() {
                return this[privateProp];
            },
            set(newValue: any) {
                this[PAGINATION_PAGE] = parseInt(newValue);
                this[privateProp] = newValue;
            },
            enumerable: true,
            configurable: true,
        });
    };
}

export function PaginationPageSize() {
    return (target: any, propertyKey: string | symbol) => {
        const privateProp = `_${String(propertyKey)}`;
        target[privateProp] = target[propertyKey];
        Object.defineProperty(target, propertyKey, {
            get() {
                return this[privateProp];
            },
            set(newValue: any) {
                this[PAGINATION_PAGE_SIZE] = parseInt(newValue);
                this[privateProp] = newValue;
            },
            enumerable: true,
            configurable: true,
        });
    };
}
