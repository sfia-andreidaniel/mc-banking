import {Request} from "express";

export interface PaginationInterface {
    page: number;
    take: number;
}

export const getPaginationFromRequest = (req: Request, defaultPerPage: number = 10, maxPerPage: number = 10): PaginationInterface => {

    let result: PaginationInterface = {
        page: 1,
        take: defaultPerPage
    };

    let page: number = parseInt(String(<any>req.query.page) || '1', 10) || 1;
    let perPage: number = parseInt( String(<any>req.query.perPage) || String(defaultPerPage), 10) || defaultPerPage;

    if (page < 1) {
        page = 1;
    }

    if (perPage < 1) {
        perPage = 1;
    }

    if (perPage > maxPerPage) {
        perPage = maxPerPage;
    }

    result.page = page;
    result.take = perPage;

    return result;
}
