import Button from "../Button/Button";
import React, {useEffect, useState} from "react";
import {clsx} from "clsx";

interface PaginationButtonsProps {
   page: number;
   numPages: number;
   onPageChange: (pageNumber: number) => void;
   className?: string;
}
const PaginationButtons = ({page, numPages, onPageChange, className}: PaginationButtonsProps) => {
    const [pageNum, setPageNum] = useState<string>(page.toString())
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const newPage = Number(pageNum);
        if(!isNaN(newPage) && newPage > 0 && newPage <= numPages) {
            onPageChange(newPage);
        }
    }

    useEffect(() => {
        setPageNum(page.toString());
    }, [page]);
    function handlePageChange (e: React.ChangeEvent<HTMLInputElement>) {
        setPageNum(e.target.value);
    }
    return (
        <div className={clsx("flex items-center justify-center gap-x-2 my-1", className)}  data-testid="pagination-buttons" >
            <Button disabled={page < 2} onClick={() => onPageChange(page-1)} data-testid="pagination-previous">&lt;</Button>
            <form onSubmit={handleSubmit} data-testid="pagination-form">
                <input type="number" className="border-1 w-10" onChange={handlePageChange} value={pageNum} data-testid="pagination-input"/> / {numPages}
            </form>

            <Button disabled={page >= numPages} onClick={() => onPageChange(page+1)} data-testid="pagination-next">&gt;</Button>
        </div>
    );
}

export default PaginationButtons