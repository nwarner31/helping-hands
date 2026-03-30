import PageCard from "../../../components/Cards/PageCard/PageCard";
import EmployeeForm from "../../../components/Forms/EmployeeForm/EmployeeForm";
import {convertToEmployeeForm, Employee, EmployeeFormData} from "../../../models/Employee";
import {EmployeeSchema} from "../../../utility/validation/employee.validation";
import {useNavigate, useParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useCallback, useState} from "react";
import {mapZodErrors} from "../../../utility/validation/utility.validation";
import {toast} from "react-toastify";
import apiService from "../../../utility/ApiService";
import LoadingText from "../../../components/TextAreas/LoadingText/LoadingText";


const EditEmployeePage = () => {
    const {employeeId} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const getEmployee = useCallback(async () => {
        const res = await apiService.get<{data: Employee}>(`employee/${employeeId}`);
        return res.data;
    }, [employeeId]);
    const {data: employee, isLoading} = useQuery({
        queryKey: ["employee", employeeId],
        queryFn: getEmployee,
        staleTime: 5 * 60 * 1000
    });
    const handleSubmit = (data: EmployeeFormData) => {
        const result = EmployeeSchema.safeParse(data);
        if(result.success) {
            mutate(data);
        } else {
            setErrors(mapZodErrors(result.error));
        }
    }
    const updateEmployee = async (employeeData: EmployeeFormData) => {
        try {
            const response = await apiService.put<{data: Employee}>(`employee/${employeeId}`, employeeData);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }
    const {mutate} = useMutation<Employee, any, EmployeeFormData>({
        mutationFn: updateEmployee,
        onSuccess: (updatedEmployee) => {
            toast.success("Employee successfully updated", {autoClose: 1500, position: "top-right"});
            // istanbul ignore next
            queryClient.setQueryData(["employees"], (prev: Employee[] | undefined) =>
                prev ? prev.map(employee => (employee.id === updatedEmployee.id) ? {...updatedEmployee} : employee): []);
            queryClient.setQueryData(["employee", employeeId], updatedEmployee);
            navigate(-1);
        }, onError: (error) => {
            if(error.errors) {
                setErrors(error.errors);
            }
        }
    })
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard title="Edit Employee" size="sm" className="py-4 px-5">
                {employee && <EmployeeForm onSubmit={handleSubmit} errors={errors} initialData={convertToEmployeeForm(employee)} />}
                {isLoading && <LoadingText className="h-75 mt-4" bgColorType="primary" />}
            </PageCard>
        </div>
    );
}

export default EditEmployeePage;