import {AuthGate} from '@/components/tpu/auth-gate';
import GameSession from '@/components/tpu/game-session';
export default function Page(){return <AuthGate><GameSession/></AuthGate>}
