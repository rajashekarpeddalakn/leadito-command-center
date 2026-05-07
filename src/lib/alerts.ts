import Swal from 'sweetalert2';

/**
 * Leadito Premium Alert System
 * Uses SweetAlert2 with customized branding to match the administrative interface.
 */

export const confirmAction = async ({
    title = "Are you sure?",
    text = "This action cannot be undone.",
    icon = "warning",
    confirmButtonText = "Yes, proceed",
    cancelButtonText = "Cancel",
    isDestructive = false
}: {
    title?: string;
    text?: string;
    icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
    confirmButtonText?: string;
    cancelButtonText?: string;
    isDestructive?: boolean;
}) => {
    const result = await Swal.fire({
        title: `<span class="font-bold text-xl tracking-tight">${title}</span>`,
        html: `<p class="text-sm text-muted-foreground font-medium leading-relaxed">${text}</p>`,
        icon: icon,
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
        reverseButtons: true,
        customClass: {
            popup: 'rounded-2xl border-0 shadow-2xl p-6 bg-card',
            confirmButton: `rounded-xl px-8 py-3 text-sm font-bold tracking-tight shadow-lg transition-all focus:ring-0 ${isDestructive
                    ? 'bg-destructive text-white hover:bg-destructive/90 shadow-destructive/20'
                    : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-primary/20'
                }`,
            cancelButton: 'rounded-xl px-8 py-3 text-sm font-bold tracking-tight text-muted-foreground hover:bg-muted focus:ring-0 mr-2',
            title: 'm-0 p-0',
            htmlContainer: 'm-0 mt-2 p-0'
        },
        buttonsStyling: false,
        showClass: {
            popup: 'animate-in fade-in zoom-in duration-300'
        },
        hideClass: {
            popup: 'animate-out fade-out zoom-out duration-200'
        }
    });

    return result.isConfirmed;
};

export const successAlert = (title: string, text?: string) => {
    return Swal.fire({
        title: `<span class="font-bold text-lg">${title}</span>`,
        html: text ? `<p class="text-sm text-muted-foreground">${text}</p>` : undefined,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
            popup: 'rounded-2xl border-0 shadow-2xl p-6 bg-card'
        }
    });
};

export const errorAlert = (title: string, text?: string) => {
    return Swal.fire({
        title: `<span class="font-bold text-lg">${title}</span>`,
        html: text ? `<p class="text-sm text-muted-foreground">${text}</p>` : undefined,
        icon: 'error',
        confirmButtonText: 'Got it',
        customClass: {
            popup: 'rounded-2xl border-0 shadow-2xl p-6 bg-card',
            confirmButton: 'rounded-xl px-8 py-2 text-sm font-bold bg-[#7c3aed] text-white'
        },
        buttonsStyling: false
    });
};
