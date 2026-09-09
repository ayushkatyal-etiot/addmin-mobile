export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  branch_type: string;
}

export interface Organisation {
  id: string;
  name: string;
  code: string;
  is_primary: boolean;
  branches: Branch[];
}

export interface CurrentContext {
  organisation_id: string;
  branch_id: string;
}

export interface User {
  id: string;
  tenant_id: string;
  org_id: string;
  home_org_id: string;
  name: string;
  email: string;
  status: string;
  is_org_admin: boolean;
  last_login_at: string;
  mfa_enabled: boolean;
  organisations: Organisation[];
  current_context: CurrentContext;
}

export interface UserState {
  user: User | null;
  isLoading: boolean;
}
