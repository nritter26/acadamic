export const ASM_SPEC = {
  id: 'asm',
  name: 'Assembly',
  keywords: [
    'mov', 'add', 'sub', 'mul', 'div', 'inc', 'dec',
    'jmp', 'je', 'jne', 'jg', 'jl', 'jge', 'jle', 'cmp',
    'call', 'ret', 'push', 'pop', 'int', 'syscall',
    'db', 'dw', 'dd', 'resb', 'resw', 'resd',
    'section', 'global', 'extern', 'align', 'bits', 'org',
  ],
  operators: ['+', '-', '*', '/', '=', '[', ']', ':', ',', ';'],
  types: ['byte', 'word', 'dword', 'qword'],
  patterns: [
    { lines: ['section .data', '  msg db "Hello, World!", 0xa', '  len equ $ - msg', '', 'section .text', '  global _start', '_start:', '  mov eax, 4', '  mov ebx, 1', '  mov ecx, msg', '  mov edx, len', '  int 0x80', '', '  mov eax, 1', '  mov ebx, 0', '  int 0x80'], tags: ['hello'] },
    { lines: ['section .text', '  global _start', '_start:', '  mov eax, 5', '  mov ebx, 3', '  add eax, ebx', '', '  mov eax, 1', '  mov ebx, 0', '  int 0x80'], tags: ['add'] },
    { lines: ['section .data', '  arr dd 10, 20, 30, 40, 50', '', 'section .text', '  global _start', '_start:', '  mov ecx, 5', '  mov esi, 0', 'loop:', '  mov eax, [arr + esi * 4]', '  inc esi', '  loop loop'], tags: ['loop'] },
    { lines: ['push ebp', 'mov ebp, esp', 'sub esp, 8', '; function body', 'mov esp, ebp', 'pop ebp', 'ret'], tags: ['prologue'] },
    { lines: ['section .text', '  global my_func', 'my_func:', '  push ebp', '  mov ebp, esp', '  mov eax, [ebp + 8]', '  add eax, [ebp + 12]', '  pop ebp', '  ret'], tags: ['function'] },
  ],
  bugs: [
    { wrong: 'mov 5, eax', right: 'mov eax, 5', prompt: 'Which is the correct mov instruction syntax (Intel syntax)?', choices: ['mov eax, 5', 'mov 5, eax', 'eax, mov 5'], answer: 'mov eax, 5' },
    { wrong: 'mov eax, 5\nadd eax, 3\nret', right: 'mov eax, 5\nadd eax, 3\nret', prompt: 'What instruction stores the result of addition?', choices: ['add eax, 3', 'add 3, eax', 'eax add 3'], answer: 'add eax, 3' },
  ],
  concepts: [
    { term: 'Registers', definition: 'Small, fast storage locations within the CPU used for immediate data processing (eax, ebx, ecx, etc.).' },
    { term: 'Stack', definition: 'A LIFO memory region used for function call frames, local variables, and temporary data via push/pop.' },
    { term: 'Calling convention', definition: 'A set of rules governing how functions receive arguments, return values, and manage the stack (e.g., cdecl, stdcall).' },
    { term: 'Syscalls', definition: 'The interface between user-space programs and the kernel, invoked via int 0x80 or syscall instructions.' },
  ],
  syntaxTests: [
    { valid: 'mov eax, 5', invalid: 'mov 5, eax', category: 'instruction' },
    { valid: 'add eax, ebx', invalid: 'add eax, 5, 10', category: 'instruction' },
    { valid: 'push ebx', invalid: 'push', category: 'instruction' },
  ],
};
