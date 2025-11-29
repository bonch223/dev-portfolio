import React, { useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';

const TechAutocomplete = ({ technologies, selected, onChange }) => {
    const [query, setQuery] = useState('');

    const filteredTechs =
        query === ''
            ? technologies
            : technologies.filter((tech) =>
                tech.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))
            );

    return (
        <div className="w-72 max-w-full">
            <Combobox value={selected} onChange={onChange}>
                <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white/50 dark:bg-slate-800/50 text-left border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-transparent sm:text-sm">
                        <Combobox.Input
                            className="w-full border-none py-2 pl-4 pr-10 text-sm leading-5 text-slate-900 dark:text-white bg-transparent focus:ring-0 focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
                            displayValue={(tech) => tech === 'All' ? '' : tech}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Filter by Technology"
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <svg
                                className="h-5 w-5 text-slate-400"
                                viewBox="0 0 20 20"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path
                                    d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </Combobox.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                    >
                        <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                            {filteredTechs.length === 0 && query !== '' ? (
                                <div className="relative cursor-default select-none py-2 px-4 text-slate-700 dark:text-slate-300">
                                    Nothing found.
                                </div>
                            ) : (
                                filteredTechs.map((tech) => (
                                    <Combobox.Option
                                        key={tech}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-cyan-500 text-white' : 'text-slate-900 dark:text-slate-100'
                                            }`
                                        }
                                        value={tech}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <span
                                                    className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                        }`}
                                                >
                                                    {tech === 'All' ? 'All Technologies' : tech}
                                                </span>
                                                {selected ? (
                                                    <span
                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-cyan-500'
                                                            }`}
                                                    >
                                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Combobox.Option>
                                ))
                            )}
                        </Combobox.Options>
                    </Transition>
                </div>
            </Combobox>
        </div>
    );
};

export default TechAutocomplete;
