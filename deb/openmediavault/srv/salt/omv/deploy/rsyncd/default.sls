# This file is part of OpenMediaVault.
#
# @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
# @author    Volker Theile <volker.theile@openmediavault.org>
# @copyright Copyright (c) 2009-2018 Volker Theile
#
# OpenMediaVault is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# any later version.
#
# OpenMediaVault is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with OpenMediaVault. If not, see <http://www.gnu.org/licenses/>.

# Documentation/Howto:
# http://www.linux-user.de/ausgabe/2006/04/090-rsync/
# http://ubuntuforums.org/showthread.php?p=7865055
# http://everythinglinux.org/rsync/
# http://www.fredshack.com/docs/rsync.html

{% set secrets_dir = salt['pillar.get']('default:OMV_RSYNCD_SECRETSFILE_DIR', '/var/lib/openmediavault') %}
{% set config = salt['omv.get_config']('conf.service.rsyncd') %}

configure_rsyncd_conf:
  file.managed:
    - name: "/etc/rsyncd.conf"
    - source:
      - salt://{{ slspath }}/files/rsyncd.conf.j2
    - context:
        config: {{ config | json }}
    - template: jinja
    - user: root
    - group: root
    - mode: 644

remove_rsyncd_secrets:
  module.run:
    - name: file.find
    - path: "{{ secrets_dir }}"
    - kwargs:
        iname: "rsyncd-*.secrets"
        delete: "f"

{% for module in config.modules.module | selectattr('enable') | selectattr('authusers') %}

configure_rsyncd_secrets_{{ module.name }}:
  file.managed:
    - name: "{{ secrets_dir | path_join('rsyncd-' ~ module.name ~ '.secrets') }}"
    - source:
      - salt://{{ slspath }}/files/secrets.j2
    - context:
        config: {{ module | json }}
    - template: jinja
    - user: root
    - group: root
    - mode: 600

{% endfor %}
