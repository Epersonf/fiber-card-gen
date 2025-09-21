import { useEffect, useState } from 'react';

/**
 * Hook para inputs numéricos bufferizados.
 * - mantém um string interno para permitir digitar '-' e valores intermediários
 * - sincroniza automaticamente com `initial` quando este muda
 * - fornece helpers para commit onBlur/Enter
 */
export function useBufferedNumberInput(initial: number) {
  const [value, setValue] = useState<string>(String(initial ?? 0));

  useEffect(() => {
    setValue(String(initial ?? 0));
  }, [initial]);

  const getOnBlur = (commitFn: (n: number) => void) => () => {
    const parsed = parseFloat(value as any);
    const final = Number.isNaN(parsed) ? 0 : parsed;
    commitFn(final);
    setValue(String(final));
  };

  const getOnKeyDown = () => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const setNumber = (n: number) => setValue(String(n));

  return { value, setValue, getOnBlur, getOnKeyDown, setNumber };
}
