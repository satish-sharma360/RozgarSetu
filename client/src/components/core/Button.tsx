import React from 'react'
import { useNavigate } from 'react-router-dom';


interface ButtonProps{
    content:string;
    path:string;
    active:boolean;
}

const Button: React.FC<ButtonProps> = ({content,path ,active}) => {

    const navigate = useNavigate()

    return (
        <div>
            <button onClick={()=> navigate(`/${path}`)} className={`px-4 py-2 rounded-md ${active? 'bg-teal-500 text-white hover:bg-teal-600' : 'border border-transparent text-gray-700 hover:bg-gray-100'}`}>{content}</button>
        </div>
    )
}

export default Button
