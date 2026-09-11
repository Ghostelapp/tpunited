import {AuthGate} from '@/components/tpu/auth-gate';
import AdminConsole from '@/components/tpu/admin-console';
export default function Page(){return <AuthGate admin><AdminConsole/></AuthGate>}
