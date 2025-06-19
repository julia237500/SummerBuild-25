-- Create notification_settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
    user_id UUID REFERENCES public.profiles(id) PRIMARY KEY,
    enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for notification_settings
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for notification_settings
CREATE POLICY "Users can view their own notification settings"
    ON public.notification_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
    ON public.notification_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
    ON public.notification_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create connected_accounts table
CREATE TABLE IF NOT EXISTS public.connected_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider, provider_account_id)
);

-- Enable RLS for connected_accounts
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL_SECURITY;

-- Create policies for connected_accounts
CREATE POLICY "Users can view their own connected accounts"
    ON public.connected_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connected accounts"
    ON public.connected_accounts FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connected accounts"
    ON public.connected_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);
