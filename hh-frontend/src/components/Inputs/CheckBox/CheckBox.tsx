import React from "react";


interface CheckBoxProps{
    name: string;
    label: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isChecked: boolean;
}

const CheckBox = ({name, label, onChange, isChecked}: CheckBoxProps) => {
    return (
        <div>
            <label htmlFor={`input-${name}`} className="mr-2">{label}</label>
            <input type="checkbox" name={name} id={`input-${name}`} onChange={onChange} checked={isChecked} className="accent-accent" />
        </div>
    );
}

export default CheckBox;