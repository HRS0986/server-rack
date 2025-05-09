'use client';

export default function Input({
  label,
  id,
  type = 'text',
  error,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`
          w-full rounded-md border border-gray-600 px-4 py-2 shadow-sm
          bg-gray-700 text-gray-100
          focus:border-blue-500 focus:outline-none focus:ring-blue-500
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
