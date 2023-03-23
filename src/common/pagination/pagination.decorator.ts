export const PAGINATION_WHERE = '_pagination_where';
export const PAGINATION_PAGE = '_pagination_page';
export const PAGINATION_PAGE_SIZE = '_pagination_page_size';

export function PaginationWhere(where?: string) {
    return (target: any, propertyKey: string | symbol) => {
        let value = target[propertyKey];

        const getter = () => {
            return value;
        };

        const setter = (newValue: any) => {
            const data = target[PAGINATION_WHERE] || {};
            const query = [where, newValue];
            data[propertyKey] = query;
            target[PAGINATION_WHERE] = data;
            value = newValue;
        };

        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true,
        });
    };
}

export function PaginationPage() {
    return (target: any, propertyKey: string | symbol) => {
        let value = target[propertyKey];

        const getter = () => {
            return value;
        };

        const setter = (newValue: any) => {
            target[PAGINATION_PAGE] = parseInt(newValue);
            value = newValue;
        };
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true,
        });
    };
}

export function PaginationPageSize() {
    return (target: any, propertyKey: string | symbol) => {
        let value = target[propertyKey];

        const getter = () => {
            return value;
        };
        const setter = (newValue: any) => {
            target[PAGINATION_PAGE_SIZE] = parseInt(newValue);
            value = newValue;
        };
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true,
        });
    };
}
