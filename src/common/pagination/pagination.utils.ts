import { SelectQueryBuilder } from 'typeorm';
import { PAGINATION_PAGE, PAGINATION_PAGE_SIZE, PAGINATION_WHERE } from './pagination.decorator';

// 用于构造DTO记录的分页查询
export class PaginationUtils {
    public static build(select: SelectQueryBuilder<any>, dto: any, andWhere = true, isPage = true) {
        // 从dto获取查询参数
        const where = dto[PAGINATION_WHERE] || {};
        const page = dto[PAGINATION_PAGE] || 1;
        const pageSize = dto[PAGINATION_PAGE_SIZE] || 10;
        const keys = Object.keys(where);
        if (keys.length > 0) {
            // 这个变量用于判断是否是第一个where条件
            let isNotFirst = andWhere;
            for (const key of keys) {
                // value是一个数组，第一个元素是查询表达式，第二个元素是查询绑定数据
                const value = where[key];
                if (value && value.length === 2 && value[0] && value[1] !== undefined && value[1] !== '') {
                    let bindData = {};
                    bindData[key] = value[1];
                    if (!(value[0] as string).includes(':')) {
                        bindData = undefined;
                    }
                    // 要处理下比如like的表达式
                    const expression = this.handleWhere(value[0], bindData, key);
                    if (isNotFirst) {
                        select.andWhere(expression[0], expression[1]);
                    } else {
                        select.where(expression[0], expression[1]);
                        isNotFirst = true;
                    }
                }
            }
        }
        // console.log(select.getSql());
        if (!isPage) {
            return select;
        }
        return select.skip((page - 1) * pageSize).take(pageSize);
    }

    private static handleWhere(expression: string, bindData: any, key: string) {
        if (bindData === undefined || bindData[key] === undefined) {
            return [expression, bindData];
        }
        if (expression.includes(' like ')) {
            const likeExpression = this.getLikeExpression(expression);
            likeExpression.right = likeExpression.right.replace(`:${key}`, bindData[key]);
            const newBindData = {};
            newBindData[key] = likeExpression.right;
            return [`${likeExpression.left}:${key}`, newBindData];
        }
        return [expression, bindData];
    }

    private static getLikeExpression(expression: string) {
        const likeIndex = expression.indexOf(' like ');
        return {
            left: expression.slice(0, likeIndex + 6),
            right: expression.slice(likeIndex + 6),
        };
    }

    public static objectToDto(object: any, dto: any) {
        if (!object) {
            return dto;
        }
        const keys = Object.keys(object);
        for (const key of keys) {
            dto[key] = object[key];
        }
        return dto;
    }
}
