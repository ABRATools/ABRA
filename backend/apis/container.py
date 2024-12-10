#!/bin/bash/python3

#'container_type':'os_name','python version',['driver','set'],['special','ebpf','rules']
container_types = {
  'dev_nightly':('rhel-9.5','3.11',
         [],['test']),
  'prod':('rhel-9.4','3.10',
         ['visual studio','gcc-devel'],['record history','monitor usage']),
  'research':('rhel-9.4','3.8',
         ['nvml','cuda-12.1'],['record history','monitor usage']),
  'jupyter':('rhel-9.4','3.8',
         ['jupyter'],['record history','monitor usage'])
}

ebpf_rules = {
  'record history':'./ebpf',
  'monitor usage':'',
  'test':'./ebpf/test.py'
}

