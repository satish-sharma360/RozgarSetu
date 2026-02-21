import React from 'react'

interface InputBoxProps {
  type: string
  name: string
  value: string
  placeholder?: string
  label?: string
  handler: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const InputBox: React.FC<InputBoxProps> = ({ type, name, value, placeholder, label, handler }) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={handler}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}

export default InputBox
