import { redirect } from 'next/navigation';

export default function NewGoalRedirectPage() {
  redirect('/app/goals?new=true');
}
