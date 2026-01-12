Config = {}

Config.Framework = 'QBCore' -- ESX or QBCore

Config.PropModel = 'prop_v_m_phone_01'

Config.Anim = 'amb@lo_res_idles@'
Config.Anim2 = 'world_human_lean_male_texting_lo_res_base'

Config.Pagerxsound = 'https://youtu.be/MjiaMNVuJ9E' -- sound when getting message

Config.Notify = {
    Wait = 'Wait ',
    Message = ' sec. until send a next message',
    Donthavepager = 'You do not have a pager',
    Invalidata = 'Please enter the recipient ID and message correctly!'
}

Config.UITranslations = {
    error_while_loading_message = 'Error while loading message',
    from = 'From: ',
    message_error = 'Message error',
    no_messages = 'No messages',
    message_sent = 'Message sent!',
    message_failed = 'Message failed!',
    sending_message = 'Sending message.',
    sending_message2 = 'Sending message..',
    sending_message3 = 'Sending message...',
    save_contact = 'Save new contact',
    recipient_id = 'Recipient ID',
    contact_name = 'Contact name',
    your_message = 'Your message',
}

--[[
Config.Notify = {
    Wait = 'Czekaj ',
    Message = ' sekund. Zanim napiszesz kolejną wiadomość',
    Donthavepager = 'Nie masz pagera',
    Invalidata = 'Napisz poprawne ID i wiadomość'
}
]]

RegisterNetEvent('pager:notification')
AddEventHandler('pager:notification', function(message)
    lib.notify({
        title = 'Pager',
        description = message,
        type = 'inform'
    })
end)

Config.MessageLimit = 5 -- message limit per pager

--[[
    Configure your special pager for specific jobs.

    How it works:
    In the Config.SpecialPager.jobnames table, you can define which jobs should receive a special pager.
    For example, if you add 'ambulance' to the list, then every player with the 'ambulance' job who opens
    the pager for the first time will have their pager automatically marked as a 'special pager'
    assigned to that job.

    What does that mean?
    From now on, you can send messages directly to those special pagers using this server-side event:

                            event name    |    message to send |  job that will receive a message | sender
        TriggerServerEvent('pager:sendCustomMessage', message, 'ambulance', '911')

    Only players with the 'ambulance' special pager will receive the message.

    ⚠️ if you have any problems or questions how exactly it works don't be afraid to open a ticket
]]

Config.SpecialPager = {
    enable = true,
    jobnames = {
        'ambulance',
        'police'
    }
}

Config.SpecialNumbers = {
    ['911'] = {
        action = function(message)
            TriggerServerEvent('pager:sendCustomMessage', message, 'ambulance', '911')
            SendNUIMessage({ action = 'PagersendMessage' })
        end
    }
}
