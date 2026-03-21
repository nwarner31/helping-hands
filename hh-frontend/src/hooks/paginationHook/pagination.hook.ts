import {useState} from "react";


export const usePagination = () => {
    const [page, setPage] = useState<number>(1);
    const [numPages, setNumPages] = useState<number>(0);
    const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

    const setSearch = (maxPages: number, pageNum?: number, newSearchTerms?: Record<string,string>) => {
        setSearchTerms(newSearchTerms ?? {});
        setPage(pageNum ?? 1);
        setNumPages(maxPages);
    }
    const nextPage = () => {
        const canAdvance = page < numPages;
        let newPage = page;
        if(canAdvance) {
            setPage(prev => prev + 1);
            newPage = page + 1;
        }
        const data = Object.keys(searchTerms).length === 0 ? {page: newPage} : {...searchTerms, page: newPage};
        return {canAdvance, data};
    }
    const previousPage = () => {
        const canDecline = page > 1;
        let newPage = page;
        if(canDecline) {
            setPage(prev => prev - 1);
            newPage = page - 1;
        }
        const data = Object.keys(searchTerms).length === 0 ? {page: newPage} : {...searchTerms, page: newPage};
        return {canDecline, data};
    }
    const goToPage = (pageNum: number) => {
        const canGoTo = pageNum > 0 && pageNum <= numPages;
        let newPage = page;
        if(canGoTo) {
            setPage(pageNum);
            newPage = pageNum
        }
        const data = Object.keys(searchTerms).length === 0 ? {page: newPage} : {...searchTerms, page: newPage};
        return {canGoTo, data};
    }

    return {setSearch, nextPage, previousPage, goToPage, page, numPages}
}